(window.webpackJsonp=window.webpackJsonp||[]).push([[0],{16:function(e,t,n){e.exports=n(27)},21:function(e,t,n){},23:function(e,t,n){},27:function(e,t,n){"use strict";n.r(t);var a=n(1),l=n.n(a),r=n(9),i=n.n(r),s=n(4),c=n(5),o=n(7),u=n(6),d=n(8),m=(n(21),n(23),n(3)),h=function(e){if(!e||"object"!==typeof e)throw new Error("Ajax options missing.");return new Promise(function(t,n){var a="string"===typeof e.method?e.method:"GET",l="string"===typeof e.url?e.url:window.location.origin,r="object"===typeof e.headers&&e.headers?e.headers:{},i=e.data,s=new XMLHttpRequest;for(var c in s.onload=function(){return t(s)},s.onerror=function(e){return n(e)},s.open(a,l,!0),r)s.setRequestHeader(c,r[c]);if(i)if("string"!==typeof i){var o=null;try{o=JSON.stringify(i)}catch(u){n(u)}s.send(o)}else s.send(i);else s.send()})},p=function(e){function t(e){var n;return Object(s.a)(this,t),(n=Object(o.a)(this,Object(u.a)(t).call(this,e))).urlsInput=null,n.state={pending:!1,message:null},n}return Object(d.a)(t,e),Object(c.a)(t,[{key:"onSubmit",value:function(e){var t=this;e.preventDefault();var n=this.urlsInput.value.split(","),a=window.location.origin.includes("localhost")?"http://localhost:8080":window.location.origin,l={"Access-Control-Allow-Origin":window.location.origin},r={method:"POST",url:"".concat(a,"/api/page/scrape"),data:{urls:n},headers:l};this.setState({pending:!0,message:"Requesting scrape..."}),h(r).then(function(e){t.setState({pending:!1,message:e.response})}).catch(function(e){t.setState({pending:!1,message:"Request Error"})})}},{key:"onClear",value:function(){this.urlsInput.value=""}},{key:"render",value:function(){var e=this;return l.a.createElement("div",null,l.a.createElement(m.f,{onSubmit:this.onSubmit.bind(this)},l.a.createElement("h3",{className:"text-center"},"Scrape Pages"),l.a.createElement(m.g,null,l.a.createElement(m.h,{innerRef:function(t){return e.urlsInput=t},type:"text",placeholder:"Enter URL(s) separated by commas here",required:!0})),l.a.createElement(m.g,{className:"text-center"},l.a.createElement(m.a,{disabled:this.state.pending},"Submit"),"\xa0",l.a.createElement(m.a,{onClick:this.onClear.bind(this),disabled:this.state.pending,type:"button"},"Clear"))),l.a.createElement("div",{className:"text-center"},this.state.message),l.a.createElement("div",null,"URL(s) placed here will be scrapped and stored in the database for quick future use. This data is not associated with any model, but can be used in model creation later."))}}]),t}(l.a.Component),g=function(e){function t(e){var n;return Object(s.a)(this,t),(n=Object(o.a)(this,Object(u.a)(t).call(this,e))).urlsInput=null,n.topicInput=null,n.state={message:null,pending:!1},n}return Object(d.a)(t,e),Object(c.a)(t,[{key:"onSubmit",value:function(e){var t=this;e.preventDefault();var n=this.urlsInput.value.split(","),a=this.topicInput.value,l=window.location.origin.includes("localhost")?"http://localhost:8080":window.location.origin,r={"Access-Control-Allow-Origin":window.location.origin},i={method:"POST",url:"".concat(l,"/api/train/").concat(a),data:{urls:n,topic:a},headers:r};h(i).then(function(e){t.setState({pending:!1,message:e.response})}).catch(function(e){t.setState({pending:!1,message:"Error"})})}},{key:"onClear",value:function(){this.urlsInput.value="",this.topicInput.value=""}},{key:"render",value:function(){var e=this;return l.a.createElement("div",null,l.a.createElement(m.f,{onSubmit:this.onSubmit.bind(this)},l.a.createElement("h3",{className:"text-center"},"Training Data"),l.a.createElement(m.g,null,l.a.createElement(m.h,{innerRef:function(t){return e.urlsInput=t},type:"text",placeholder:"Enter training URL(s) here, comma separated",required:!0})),l.a.createElement(m.g,null,l.a.createElement(m.h,{innerRef:function(t){return e.topicInput=t},type:"text",placeholder:"Enter training topic",required:!0})),l.a.createElement(m.g,{className:"text-center"},l.a.createElement(m.a,{disabled:this.state.pending},"Submit"),"\xa0",l.a.createElement(m.a,{onClick:this.onClear.bind(this),disabled:this.state.pending,type:"button"},"Clear"))),l.a.createElement("div",{className:"text-center"},this.state.message),l.a.createElement("div",null,"URL(s) placed here will be loaded and used to create a training model."))}}]),t}(l.a.Component),b=function(e){function t(e){var n;return Object(s.a)(this,t),(n=Object(o.a)(this,Object(u.a)(t).call(this,e))).urlsInput=null,n.topicInput=null,n.state={message:null,pending:!1},n}return Object(d.a)(t,e),Object(c.a)(t,[{key:"onSubmit",value:function(e){var t=this;e.preventDefault();var n=this.urlsInput.value.split(","),a=this.topicInput.value,l=window.location.origin.includes("localhost")?"http://localhost:8080":window.location.origin,r={"Access-Control-Allow-Origin":window.location.origin},i={method:"POST",url:"".concat(l,"/api/predict/").concat(a),data:{urls:n,topic:a},headers:r};h(i).then(function(e){t.setState({pending:!1,message:e.response})}).catch(function(e){t.setState({pending:!1,message:"Error"})})}},{key:"onClear",value:function(){this.urlsInput.value="",this.topicInput.value=""}},{key:"render",value:function(){var e=this;return l.a.createElement("div",null,l.a.createElement(m.f,null,l.a.createElement("h3",{className:"text-center"},"Model Prediction"),l.a.createElement(m.g,null,l.a.createElement(m.h,{innerRef:function(t){return e.urlsInput=t},type:"text",placeholder:"Enter URL(s) to test, comma separated",required:!0})),l.a.createElement(m.g,null,l.a.createElement(m.h,{innerRef:function(t){return e.topicInput=t},type:"text",placeholder:"Enter topic to test",required:!0})),l.a.createElement(m.g,{className:"text-center"},l.a.createElement(m.a,{disabled:this.state.pending},"Submit"),"\xa0",l.a.createElement(m.a,{onClick:this.onClear.bind(this),disabled:this.state.pending,type:"button"},"Clear"))),l.a.createElement("div",{className:"text-center"},this.state.message),l.a.createElement("div",null,"URL(s) placed here will be loaded and checked against the trained model."))}}]),t}(l.a.Component),f=function(e){function t(e){var n;return Object(s.a)(this,t),(n=Object(o.a)(this,Object(u.a)(t).call(this,e))).urlsInput=null,n.state={message:null,pending:!1},n}return Object(d.a)(t,e),Object(c.a)(t,[{key:"onSubmit",value:function(e){var t=this;e.preventDefault();var n=encodeURIComponent(this.urlsInput.value),a=window.location.origin.includes("localhost")?"http://localhost:8080":window.location.origin,l={"Access-Control-Allow-Origin":window.location.origin},r={method:"GET",url:"".concat(a,"/api/page/csv?urls=").concat(n),headers:l};this.setState({pending:!0,message:"Requesting CSV file..."}),h(r).then(function(e){if(200===e.status){t.setState({pending:!1,message:""});var n=new Blob([e.response],{type:"octet/stream"}),a=document.createElement("a"),l=window.URL.createObjectURL(n);a.setAttribute("download","words.csv"),a.setAttribute("href",l),a.click(),window.URL.revokeObjectURL(l)}else t.setState({pending:!1,message:e.response})}).catch(function(e){t.setState({pending:!1,message:"Request error."})})}},{key:"onClear",value:function(){this.urlsInput.value=""}},{key:"render",value:function(){var e=this;return l.a.createElement("div",null,l.a.createElement(m.f,{onSubmit:this.onSubmit.bind(this)},l.a.createElement("h3",{className:"text-center"},"Download CSV"),l.a.createElement(m.g,null,l.a.createElement(m.h,{innerRef:function(t){return e.urlsInput=t},placeholder:"Enter URL(s) for their combined CSV data",type:"text",required:!0})),l.a.createElement(m.g,{className:"text-center"},l.a.createElement(m.a,{disabled:this.state.pending},"Submit"),"\xa0",l.a.createElement(m.a,{onClick:this.onClear.bind(this),disabled:this.state.pending,type:"button"},"Clear"))),l.a.createElement("div",{className:"text-center"},this.state.message),l.a.createElement("div",null,"URL(s) placed here will be searched for in the database. A CSV file will be downloaded with all the data about the URL(s)."))}}]),t}(l.a.Component),E=function(e){function t(){return Object(s.a)(this,t),Object(o.a)(this,Object(u.a)(t).apply(this,arguments))}return Object(d.a)(t,e),Object(c.a)(t,[{key:"render",value:function(){return l.a.createElement("div",null,l.a.createElement("br",null),l.a.createElement(m.e,null,l.a.createElement(m.b,{color:"light"},l.a.createElement(m.c,null,l.a.createElement(m.i,null,l.a.createElement(m.d,{lg:6},l.a.createElement(p,null)),l.a.createElement(m.d,{lg:6},l.a.createElement(f,null))),l.a.createElement("br",null),l.a.createElement(m.i,null,l.a.createElement(m.d,{lg:6},l.a.createElement(g,null)),l.a.createElement(m.d,{lg:6},l.a.createElement(b,null)))))))}}]),t}(l.a.Component);i.a.render(l.a.createElement(E,null),document.querySelector("#root"))}},[[16,2,1]]]);
//# sourceMappingURL=main.f3f56a2c.chunk.js.map