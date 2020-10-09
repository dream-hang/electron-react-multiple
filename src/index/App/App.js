import React, { useState, useEffect } from 'react';
import logo from '../logo.svg';
import './App.css';
import { download, unpackPath } from '../../common/api/download';
import { judgeOS } from '../../common/common';
import DB from '../../common/db/db';

function App() {
	const [count, setCount] = useState(0);
	useEffect(() => {
		initDB()
		return () => {
			console.log('卸载');
		};
	}, []);
	const initDB = () => {
		DB.set("data",11)
		console.log(DB.get("data"));
	}
	const toPopupFn = () => {
		DB.set('islogin',0)
		setCount(count=>count+1)
	}
	const inputChange = (e) => {
		setCount(e.target.value)
	}
	/**
     * 更改下载目录的读取写入权限 如果软件安装在windows环境下的C盘 需要提高权限才可以替换文件 
	 * 如果在打包时整体提高软件权限 那全量更新时会导致安装不上的问题
     */
    const disposeJurisdiction = () =>{
        var options = {
            name: 'studio'
        }
        window.sudo.exec(`cacls "${unpackPath.slice(0,unpackPath.length -1)}" /t /e /c /g everyone:F`, options, 
            function (error, stdout, stderr) {
                if (error) {
                    // 无操作文件权限
                    return 
				}
				// 更新两个文件夹
                let one = download("")
                let two = download("")
                Promise.all([one, two]).then(res=>{
                    window.remote.app.relaunch();
                    window.remote.app.exit(0);
                })
            }
        )
    }
	return (
		<div className="App">
			<header className="App-header">
				<img src={logo} className="App-logo" alt="logo" />
				<input type="text" value={count} onChange={inputChange}/>
				<div>{count}</div>
				<button onClick={toPopupFn}>按钮</button>
				<a
					className="App-link"
					href="https://reactjs.org"
					target="_blank"
					rel="noopener noreferrer"
					>
					Learn React
				</a>
			</header>
		</div>
	);
}

export default App;
