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
  stream: true,
  temperature: 1,
  top_p: 1,
  logprobs: false,
  top_logprobs: null
};

let config = {
  method: 'POST',
  maxBodyLength: Infinity,
  headers: {
    'Content-Type': 'application/json;charset=utf-8',
    'Accept': 'text/event-stream',
    'Authorization': 'Bearer'
  },
  body: ""
};


export const createRequest = async (apiKey: string, content: string,onMessage: Function) => {
  const message = {
    content: content,
    role: "user"
  }

  config.headers.Authorization = `Bearer ${apiKey}`;
  data.messages.push(message);
  config.body = JSON.stringify(data);
  try {
    const response = await fetch('https://api.deepseek.com/chat/completions', config)
    const reader = response.body?.getReader();
    // 解析数据流
    const readStream = async () => {
      while (true) {
        const { done, value } = await reader?.read();
        if (done) {
          console.log('数据流下载完毕');
          return;
        }
        const decoder = new TextDecoder();
        const decodedString = decoder.decode(value);
        let str = decodedString.replace(/^data: \s*/g, "") // 使用全局替换
          .replace(/\n/g, "");
        if (str === '[DONE]') {
          console.log('数据流下载完毕');
          return;
        }
        str = str.split('data: ');
        onMessage(str && str[str.length - 1]);
      }
    }

    await readStream();


    // const data: string = JSON.stringify(response.data);
    // console.log(data);
    // return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
}