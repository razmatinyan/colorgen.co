import { Configuration, OpenAIApi } from 'openai';

const runtimeConfig = useRuntimeConfig();
const configuration = new Configuration({
    apiKey: runtimeConfig.apikey,
});
const openai = new OpenAIApi(configuration);

export default defineEventHandler(async (event) => {
    const url = getQuery(event);
    const color = url.color;

    const response = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: `Create one color palette of 5 colors for this color: "#${color}", where two colors will be of another shade. Show the result in JSON format only like this: 
      "{
        "colors": [
            "color", "color", "color"
        ]
      }".`,
      temperature: 0,
      max_tokens: 3000,
      top_p: 1,
      frequency_penalty: 0.5,
      presence_penalty: 0,
    });

    return {
        response: response.data.choices[0].text
    }
});