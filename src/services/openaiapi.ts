import { OpenAI } from "openai";
import { PriceApiProduct, SliderState } from "../interfaces";


const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPEN_AI_API_KEY,
  dangerouslyAllowBrowser: true,
});

async function uploadFile(combinedResults: PriceApiProduct[]) {
  const combinedResultsJson = JSON.stringify(combinedResults);
  const blob = new Blob([combinedResultsJson], { type: 'application/json' });

  try {
    const response = await openai.files.create({
      file: new File([blob], 'combinedResults.json'),
      purpose: "assistants",
    });

    console.log({ response });
    return response;
  } catch (error) {
    console.error("Error calling OpenAI:", error);
    throw error;
  }
}

function extractProductId(response: string): string | null {
  // Regular expression to match a product ID pattern, considering both single quotes and backticks
  const productIdPattern = /['`*]([A-Za-z0-9\-_]+)['`*]/;
  const match = response.match(productIdPattern);

  return match ? match[1] : null;
}

export async function processWithOpenAI(combinedResults: PriceApiProduct[], userIinstructions: string, preferences: SliderState) {
  const fileResponse = await uploadFile(combinedResults);

  // Check if the file upload was successful
  if (!fileResponse) {
    console.error("Failed to upload file for processing.");
    // Handle the error accordingly, e.g., return an error message
    return {
      id: null,
      message: "Failed to upload product data for analysis. Please try again later."
    };
  }

  const file = fileResponse;

  const instructions = `
    Thoroughly examine the JSON dataset of product listings to identify the most value-driven option for consumers. Factor in all relevant details such as price, shipping, ratings, and other specifics. Compute the total cost, assess product ratings, and evaluate distinctive features or limitations. Your aim is to determine the product offering the best overall value among all options presented.
    
    Always return a product id even if its less than ideal against the request.

    If nothing is found in the dataset. Respond with I've searched my extensive database but came up empty handed. Please adjust the search and I can look again!
  `;

  const assistant = await openai.beta.assistants.create({
    name: "Product Recommendation Assistant",
    instructions,
    tools: [{ type: "code_interpreter" }],
    model: "gpt-3.5-turbo",
    file_ids: [file.id],
  });

  const thread = await openai.beta.threads.create({
    messages: [
      {
        role: "user",
        content: `Analyze the provided JSON file taking into account the ${userIinstructions} Analyze the provided JSON file taking into account the ${userIinstructions}, users rating of important on a scale of 0-100 ${JSON.stringify(preferences)}, and DO NOT RETURN ANYTHING BUT THE product ID string!`,
        file_ids: [file.id],
      }
    ]
  });
  let run = await openai.beta.threads.runs.create(
    thread.id,
    {
      assistant_id: assistant.id,
    },
  );
  let runResults
  while (!runResults) {
    // Poll results every second.
    await new Promise((r) => setTimeout(r, 1000))
    run = await openai.beta.threads.runs.retrieve(thread.id, run.id)
    if (run.status !== 'in_progress') {
      runResults = run
      break
    }
  }

  const messages = await openai.beta.threads.messages.list(
    thread.id
  );

  console.log({ answer: messages.data[0]?.content[0]?.text?.value });

  const productId = extractProductId(messages.data[0]?.content[0]?.text?.value);

  return { id: productId, message: messages.data[0]?.content[0]?.text?.value };
}
