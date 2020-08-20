import React ,{ Component } from 'react';
/**
 * 崩溃信息收集类
 */
class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, eventId: null };
    }
    static getDerivedStateFromError(error) {
        return { hasError: true };
    }
    componentDidCatch(error, info) {
        // 你同样可以将错误日志上报给服务器
        // logErrorToMyService(error, info);
    }
    render() {
        if (this.state.hasError) {
            // 你可以自定义降级后的 UI 并渲染
            return <div className="error-boundary">我们遇到了些问题。需要您退出软件，重新登录！</div>;
        }
        return this.props.children; 
    }
}

export default ErrorBoundary;