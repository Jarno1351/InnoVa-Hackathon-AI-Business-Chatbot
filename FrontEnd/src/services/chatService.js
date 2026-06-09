import { apiRequest } from './httpClient.js';

export function sendChatMessage(message) {
  return apiRequest('/chat/message', {
    method: 'POST',
    body: JSON.stringify({ message })
  });
}
