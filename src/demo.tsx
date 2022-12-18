import {createRoot} from "react-dom/client.js";
import {of, tap, map, filter, switchMap} from "rxjs";
import * as React from 'react';
import {
    startPistolReact,
    pistolLogin,
    usePistolAuth,
    putPistolValue,
    usePistolKeys,
    usePistolValue,
    dialPeerConnection
} from "@scottburch/pistol/lib/react/react-pistol.js";
import {useState} from "react";


setTimeout(() => {
    startPistolReact().pipe(
        map(() => document.querySelector('#app')),
        filter(el => !!el),
        map(el => createRoot(el as HTMLElement)),
        tap(root => root.render(<App/>)),

        tap(() => getPeerNum() !== undefined ? dialPeerConnection(`ws://localhost:1111${getPeerNum()}`) : of(true))
    ).subscribe();
});

const getPeerNum = () => /peer=/.test(window.location.href) ? parseInt(window.location.href.replace(/.*peer=(.)/, '$1')) : undefined

const App: React.FC = () => {
    const auth = usePistolAuth();
    return (
        <>
            <Header/>
            <div style={{padding: 20}}>
                {auth.username ? <MessagePage/> : <Login/>}
            </div>
        </>
    );
};

const Header: React.FC = () => {
    const auth = usePistolAuth();

    return <div style={{background: 'black', color: 'white', padding: 5, display: 'flex'}}>
        <h2 style={{flex: 1}}>Pistol Demo</h2>
        <div>{auth.username ? `Welcome ${auth.username}` : ''}</div>
    </div>
};


const Login: React.FC = () => {
    let username = '';
    let password = '';

    const doAuth = () => pistolLogin(username, password);

    const keyUp = (code: string) => code === 'Enter' && doAuth();

    return <>
        <h3>Login with any username and password</h3>
        <div>
            <input autoFocus onBlur={ev => username = ev.target.value} onKeyUp={ev => keyUp(ev.code)}
                   placeholder="Username"/>
        </div>
        <div>
            <input type="password" onBlur={ev => password = ev.target.value} onKeyUp={ev => keyUp(ev.code)}
                   placeholder="Password"/>
        </div>
        <div>
            <button onClick={doAuth}>Login</button>
        </div>
    </>;
};

const MessagePage: React.FC = () => (
    <>
        <SendBox/>
        <hr/>
        <MessageList/>
    </>
)

const SendBox: React.FC = () => {
    const [text, setText] = useState('');
    const auth = usePistolAuth();

    const sendText = () => {
        putPistolValue(`my.messages.${Date.now()}`, JSON.stringify({
            text,
            username: auth.username
        }));
        setText('');
    };


    const keyUp = (code: string) => code === 'Enter' && sendText()

    return <>
        <div>
            <input autoFocus style={{width: '100%'}} onChange={ev => setText(ev.target.value)}
                   onKeyUp={ev => keyUp(ev.code)} value={text}/>
        </div>
        <button onClick={sendText}>Send</button>
    </>;
};

const MessageList: React.FC = () => {
    const times = usePistolKeys('my.messages');
    return <>{times.map(time => <MessageItem key={time} time={time}/>)}</>
};

const MessageItem: React.FC<{ time: string }> = ({time}) => {
    const strData = usePistolValue(`my.messages.${time}`) as string;
    const data = strData ? JSON.parse(strData) : {};
    const [editMode, setEditMode] = useState(false);

    const updateText = (text: string) => {
        putPistolValue(`my.messages.${time}`, JSON.stringify({...data, text}));
        setEditMode(false);
    }

    return <div style={{border: '1px solid #888', display: "flex", padding: 5}}>
        <div style={{flex: 1}}>
            <strong>{data.username}</strong>
            <div>
                {editMode ?
                    <input defaultValue={data.text} onBlur={ev => updateText(ev.target.value)}/> : data.text}
            </div>
        </div>
        <div>
            {new Date(parseInt(time)).toLocaleString()}
            <div style={{textAlign: 'right'}}>
                <button onClick={() => setEditMode(true)}>Edit</button>
            </div>
        </div>
    </div>;
};




