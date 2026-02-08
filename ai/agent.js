const { Agent, run, tool, RunContext, InputGuardrailTripwireTriggered } = require("@openai/agents");
const z = require("zod");
require('dotenv').config()
const axios = require("axios");




const agent_out_guardrail = new Agent({
    name: "Agent Output Guardrail",
    model: 'gpt-4o-mini',
    instructions: 'you check the output of the agent if the agent output is any abuse then return false else return true',
    outputType: z.object({
        ValidQuestion: z.boolean().describe("if the output is valid then return true else false"),
        reasoning: z.string().describe("reason for the answer"),
    }),
})
const out_guardrail = {
    name: "Output Guardrail",
    execute: async (output) => {

        const resutl = await run(
            agent_out_guardrail,
            output.agentOutput,
        )
        return {
            reason: resutl.finalOutput?.reasoning,
            tripwireTriggered: !resutl.finalOutput?.ValidQuestion,
            outputInfo: resutl.finalOutput,
        };
    },
}

const MenuTool = tool({
    name: "Get_menu",
    description: "Search menu details",
    parameters: z.object({}),
    execute: async () => {
        const response = await axios.get('http://localhost:5000/api/menu')
        const res = response.data

        const menu = res.map((item) => ({
            id: item._id,
            name: item.name,
            price: item.price,
            category: item.category,
            description: item.description
        }))


        return menu
    }
})

const ordertool = tool({
    name: "order_tool",
    description: "Place order",
    needsApproval: true,
    parameters: z.object({
        items: z.array(z.object({
            menuItemId: z.string().describe("id of the item you get from Get_menu tool "),
            name: z.string().describe("name of the item the user describe and you get from Get_menu tool "),
            price: z.number().describe("price of the item you get from Get_menu tool"),
            quantity: z.number().describe("quantity of the item you get from user")
        })).describe("items in the order"),
        total: z.number().describe("total amount of order or total price of order"),
        usernumber: z.string().describe("user number you get from user")
    }),
    execute: async ({ items, total, usernumber }, runContext) => {
        const ctx = runContext?.context;


        const response = await axios.post('http://localhost:5000/api/orders', {
            userId: ctx?.userid,
            items,
            total,
            status: "pending",
            usernumber,
        }, {
            headers: {
                "Authorization": `Bearer ${ctx?.token}`
            }
        })
        const res = response.data
        return res
    }
})

// const GetUserContext = tool({
//     name: "get_user_context",
//     description: "Returns current user name and id",
//     parameters: z.object({}),
//     execute: async (_, runContext?: RunContext<LocalContext>) => {
//         const ctx = runContext?.context;
//         return `Your name is ${ctx?.name}`;
//     }
// });

const gettabledata = tool({
    name: "get_table_data",
    description: "Get table data and also get tableId from table data",
    parameters: z.object({}),
    execute: async () => {
        const response = await axios.get('http://localhost:5000/api/tables')
        const res = response.data
        return res
    }
})

const booktable = tool({
    name: "book_table",
    description: "Book a table",
    parameters: z.object({
        tableId: z.string().describe("tableId of the table you get from get_table_data tool"),
        hours: z.number().describe("hours for which the table is booked you get from user and 1 <= hours <= 3 is allowed")
    }),
    execute: async ({ tableId, hours }, runContext) => {
        const ctx = runContext?.context;
        const response = await axios.post('http://localhost:5000/api/tables/book', {
            tableId,
            userId: ctx?.userid,
            hours
        }, {
            headers: {
                "Authorization": `Bearer ${ctx?.token}`
            }
        })
        const res = response.data
        return res
    }
})

const GeneralAgent = new Agent < LocalContext > ({
    name: "GeneralAgent",
    model: "gpt-4o-mini",
    outputGuardrails: [out_guardrail],
    instructions: `You are a professional restaurant virtual assistant for our restaurant website.

Your role is to help customers with restaurant-related information only.

You must:

• Greet customers politely and professionally
• Provide menu details 
• Help with placing orders and reservations

IMPORTANT MENU RULES:

• if user want to order something then first check menu at once using Get_menu tool 
• without call menutool dont give menu items to user

IMPORTANT ORDER RULES:

• if user want to order something then first check menu at once using Get_menu tool and then place order using order_tool
• if user not give number then ask user for number without number dont call order_tool

IMPORTANT BOOK TABLE RULES:
• call get_table_data tool first for get tableId it is necessary
• if user want to book a table then first check table data using you must call get_table_data tool at once and then book table using book_table tool
• if user not give hours then ask user for hours without hours dont call book_table tool
• Call get_table_data only once per user request session. Reuse previous data if available


You must NOT:

• Talk about unrelated topics like politics, technology, coding, history, or personal advice
• Generate offensive, inappropriate, or misleading content
• Provide medical, legal, or financial advice
* you give user response in good format
• Call tools only when necessary dont call tools again and again if dont need to call tool -- important

If a user asks about something not related to the restaurant, politely respond:

"I'm here to help with restaurant-related questions only. Please ask about our menu, orders, or services."

Always keep responses:

• Friendly  
• Professional  
• Short and clear  

Your goal is to give excellent customer service and improve the restaurant experience.
`,
    tools: [MenuTool, ordertool, gettabledata, booktable],
});

export async function runAgent(
    question,
    context
) {

    try {
        const result = await run(GeneralAgent, question, {
            context
        });
        return result;
    } catch (e) {
        if (e instanceof InputGuardrailTripwireTriggered) {
            return 'i am not able to answer your question'
        }
    }
}





