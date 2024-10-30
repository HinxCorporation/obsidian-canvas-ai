import CanvasAiPlugin from "main";
import { randomUUID } from 'crypto';
import { Menu, MenuItem } from 'obsidian';
import { CanvasNode } from 'obsidian-typings'

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

export default class ChatCanvasExtension {
  plugin: CanvasAiPlugin;

  constructor(plugin: CanvasAiPlugin) {
    this.plugin = plugin;

    // 注册一个事件监听器，当用户在canvas上点击右键菜单时，多加一个菜单项
    this.plugin.registerEvent(
      this.plugin.app.workspace.on('canvas:node-menu', (menu: Menu, node: CanvasNode) => {
        console.log('触发事件 - canvas:node-menu');
        menu.addItem((item: MenuItem) => {
          item.setTitle('提交到Ai');
          item.onClick(async () => {
            // 创建textNode
            let height = node.height;
            let y = node.y + height + 30;
            const answerTextNode = node.canvas.createTextNode({
              pos: { x: node.x, y },
              text: "Loading...",
              size: { width: node.width, height },
              focus: false,
            })
            // console.log("node", node)
            // console.log("newTextNode", newTextNode);

            // 创建连接线
            const edge = {
              id: randomUUID().replace(/-/g, '').toString().substring(0, 16),
              fromSide: "bottom",
              fromNode: node.id,
              toSide: "top",
              toNode: answerTextNode.id,
            }

            const canvasData = node.canvas.getData();
            canvasData.edges.push(edge);
            node.canvas.setData(canvasData);

            let text = "";
            // 提交prompt到ai服务，获取返回json数据
            this.createRequest(node.text, (message: string) => {
              if (message === '[DONE]') {
                let answerTextNodeData = answerTextNode.getData();
                answerTextNodeData.height += 10;
                // 更新answerTextNode的高度
                answerTextNode.setData(answerTextNodeData);
                node.canvas.requestSave();
                // 添加追问的TextNode
                const askTextNode = node.canvas.createTextNode({
                  pos: { x: answerTextNode.x, y: answerTextNode.y + answerTextNode.height + 30 },
                  text: "",
                  focus: true,
                })
                // 添加连接线
                const askEdge = {
                  id: randomUUID().replace(/-/g, '').toString().substring(0, 16),
                  fromSide: "bottom",
                  fromNode: answerTextNode.id,
                  toSide: "top",
                  toNode: askTextNode.id,
                }
                const canvasData = node.canvas.getData();
                canvasData.edges.push(askEdge);
                node.canvas.setData(canvasData);
                return;
              }

              // 返回的token
              console.log(message);
              const token = JSON.parse(message).choices[0].delta.content;
              text += (token);
              answerTextNode.setText(text);

              // 获取answerTextNode的Data
              let answerTextNodeData = answerTextNode.getData();
              // 获取answerTextNode的高度
              let oldHeight = answerTextNodeData.height;
              // 获取文本高度（包括不可见高度）
              let height = answerTextNode.contentEl.firstChild.firstChild.scrollHeight;
              if (oldHeight < height) {
                answerTextNodeData.height = height;
                // 更新textNode的高度
                answerTextNode.setData(answerTextNodeData);
              }
            });
          });
        })
      })
    );
  }

  createRequest = async (content: string, onMessage: Function) => {
    const message = {
      content: content,
      role: "user"
    }

    const customInstructions = {
      content: this.plugin.settings.getSetting('customInstructions'),
      role: "system"
    }

    let data: requestData = {
      messages: [customInstructions],
      model: this.plugin.settings.getSetting('llm'),
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

    const config = {
      method: 'POST',
      maxBodyLength: Infinity,
      headers: {
        'Content-Type': 'application/json;charset=utf-8',
        'Accept': 'text/event-stream',
        'Authorization': 'Bearer'
      },
      body: ""
    };

    config.headers.Authorization = `Bearer ${this.plugin.settings.getSetting('apiKey')}`;
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
          const strArray = str.split('data: ');
          onMessage(strArray && strArray[strArray.length - 1]);
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


}
