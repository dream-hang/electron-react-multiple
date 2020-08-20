import React, { useState, useEffect } from 'react';
import { Route, Switch, withRouter } from 'react-router-dom'
import {sources} from '../common/api/server';
import DB from '../common/db/db';
import App from '../index/App/App';
import Login from '../index/Login/Login';

function Router(props) {
    const [pathname, setpathname] = useState(props.history.location.pathname);

    const checkJsessionID = () => {
        if (props.history.location.pathname !== '/login') {
            if (DB.get('islogin') === 0) {
                props.history.replace('/login')
            }
        } else {
            if (DB.get('islogin') === 1) {
                props.history.replace('/app')
            }
        }
    }

    useEffect(() => {
        if (pathname === '/') {
            if (DB.get('islogin') === 1) {
                props.history.replace('/app')
            } else {
                props.history.replace('/login')
            }
        } else {
            checkJsessionID()
        }
    }, [])

    useEffect(() => {
        checkJsessionID()
        Object.keys(sources).forEach(item => {
            sources[item]('取消前页面请求')
        })
        for (var key in sources) {
            delete sources[key]
        }
    })

    return(
        <Switch>
            <Route path='/login' component={Login} />
            <Route path='/app' component={App} />
        </Switch>
    )
}

export default withRouter(Router);