import React, { useState, useEffect } from 'react';
import DB from '../../common/db/db';
import { withRouter } from 'react-router-dom'

function Login(props) {
    const loginFn = () =>{
        DB.set('islogin',1)
        props.history.replace('/app')
        console.log(1111111);
    }
    return(
        <React.Fragment>
            <button onClick={loginFn}>登录</button>
        </React.Fragment>
    )
}

export default withRouter(Login)

