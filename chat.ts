import axios from "axios";

interface requestData {
  messages: { content: string; role: string }[];
  model: string;
  frequency_penalty: number;
  max_tokens: number;
  presence_penalty: number;
  stop: null;
  stream: boolean;
  temperature: number;
  top_p: number;
  logprobs: boolean;
  top_logprobs: null;
}

let data: requestData = {
  messages: [],
  model: "deepseek-coder",
  frequency_penalty: 0,
  max_tokens: 2048,
  presence_penalty: 0,
  stop: null,
  stream: false,
  temperature: 1,
  top_p: 1,
  logprobs: false,
  top_logprobs: null
};

let config = {
  method: 'post',
  maxBodyLength: Infinity,
  url: 'https://api.deepseek.com/chat/completions',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Authorization': 'Bearer'
  },
  data: ""
};


export const createRequest = async (apiKey: string, content: string) => {
  const message = {
    content: content,
    role: "user"
  }

  config.headers.Authorization = `Bearer ${apiKey}`;
  data.messages.push(message);
  config.data = JSON.stringify(data);
  try {
    const response = await axios(config);
    const data: string = JSON.stringify(response.data);
    console.log(data);
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
}