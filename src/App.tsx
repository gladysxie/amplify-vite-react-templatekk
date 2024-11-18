import  { useEffect, useState } from "react";
import { useAuthenticator } from "@aws-amplify/ui-react";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "../amplify/data/resource";

const client = generateClient<Schema>();

function App() {
    const { user, signOut } = useAuthenticator();
    const senderEmail = user?.signInDetails?.loginId || "";
    const userN = user?.username || "Unknown User";
    const [messages, setMessages] = useState<Array<Schema["Todo"]["type"]>>([]);
    const [inputValue, setInputValue] = useState<string>("");

    useEffect(() => {
        const subscription = client.models.Todo.observeQuery().subscribe({
            next: (data) => setMessages([...data.items]),
            error: (err) => console.error("Error observing messages:", err),
        });
        return () => subscription.unsubscribe();
    }, []);

    useEffect(() => {
        const chatContainer = document.querySelector("#chat-container");
        if (chatContainer) {
            chatContainer.scrollTop = chatContainer.scrollHeight;
        }
    }, [messages]);

    const sendMessage = () => {
        if (inputValue.trim()) {
            client.models.Todo.create({
                content: inputValue.trim(),
                email: senderEmail,
                userName: userN,
            });
            setInputValue(""); // 清空输入框
        }
    };

    const generateAvatarColor = (email: string): string => {
        const hash = Array.from(email || "?").reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const colors = ['#8e44ad'];
        return colors[hash % colors.length];
    };

    const generateAvatar = (email: string) => {
        const firstLetter = email ? email.charAt(0).toUpperCase() : '?';
        const bgColor = generateAvatarColor(email);
        return (
            <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: bgColor,
                color: '#fff',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                fontSize: '20px',
                fontWeight: 'bold',
                boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)',
            }}>
                {firstLetter}
            </div>
        );
    };

    return (
        <main style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            background: 'linear-gradient(to bottom right, #8e44ad, #3498db, #2ecc71)',
            minHeight: '100vh',
            padding: '20px',
            fontFamily: 'Arial, sans-serif',
        }}>
            <h1>{user?.signInDetails?.loginId}'s chatroom</h1>
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                width: '800px',
                paddingBottom: '20px',
            }}>
                <h1 style={{ margin: 0, color: '#fff', fontSize: '26px', fontWeight: 'bold' }}>Chatroom</h1>
                <button onClick={signOut} style={{
                    padding: '10px 20px',
                    borderRadius: '8px',
                    backgroundColor: '#e74c3c',
                    color: '#fff',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    border: 'none',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.2)',
                    transition: 'transform 0.3s',
                }}
                    onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                    onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >Sign out
                </button>
            </div>

            <div id="chat-container" style={{
                border: '1px solid #ddd',
                padding: '20px',
                width: '800px',
                height: '500px',
                overflowY: 'scroll',
                backgroundColor: '#ffffff',
                borderRadius: '15px',
                boxShadow: '0 6px 15px rgba(0, 0, 0, 0.2)',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
            }}>
                {messages.map((message) => {
                    const isCurrentUser = (message.email === user?.signInDetails?.loginId);
                    return (
                        <div key={message.id} style={{
                            display: 'flex',
                            flexDirection: isCurrentUser ? 'row-reverse' : 'row',
                            alignItems: 'center',
                            gap: '10px',
                        }}>
                            {generateAvatar(senderEmail || "User")}
                            <div style={{
                                maxWidth: '70%',
                                padding: '12px 16px',
                                backgroundColor: isCurrentUser ? '#8e44ad' : '#ecf0f1',
                                color: isCurrentUser ? '#fff' : '#2c3e50',
                                borderRadius: isCurrentUser ? '15px 0 15px 15px' : '0 15px 15px 15px',
                                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                                textAlign: 'left',
                                wordBreak: 'break-word',
                            }}>
                                {/* 添加发送者邮箱 */}
                                <p style={{
                                    margin: 0,
                                    color: '#ffffff', // 白色
                                    fontSize: '10px',
                                    marginBottom: '5px',
                                    }}>{message.email}</p>
                                <p style={{ margin: 0 }}>{message.content}</p>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                width: '800px',
                marginTop: '20px',
                gap: '10px',
            }}>
                <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Type your message..."
                    style={{
                        flex: 1,
                        padding: '12px',
                        borderRadius: '20px',
                        border: '1px solid #ddd',
                        fontSize: '16px',
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                        backgroundColor: '#fff',
                        outline: 'none',
                    }}
                />
                <button onClick={sendMessage} style={{
                    padding: '12px 24px',
                    borderRadius: '20px',
                    backgroundColor: '#3498db',
                    color: '#fff',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    fontSize: '16px',
                    border: 'none',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.2)',
                    transition: 'transform 0.3s, background-color 0.3s',
                }}
                    onMouseOver={(e) => {
                        e.currentTarget.style.backgroundColor = '#2980b9';
                        e.currentTarget.style.transform = 'scale(1.05)';
                    }}
                    onMouseOut={(e) => {
                        e.currentTarget.style.backgroundColor = '#3498db';
                        e.currentTarget.style.transform = 'scale(1)';
                    }}
                >Send
                </button>
            </div>
        </main>
    );
}

export default App;



