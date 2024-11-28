import{_ as n,u as d,o,c as r,a as s,w as u,b as a,v as c,d as h,n as p}from"./index-b6c7fe62.js";const m={setup(){return{auth:d()}}},f={class:"flex flex-col justify-center py-20 sm:px-6 lg:px-8"},w={class:"mt-8 sm:mx-auto sm:w-full sm:max-w-md"},g={class:"bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10"},x={class:"relative mt-1"},b=s("div",{class:"absolute inset-y-0 right-0 flex items-center px-2"},[s("svg",{class:"field-icon email-icon",width:"20",height:"20",viewBox:"0 0 20 20",fill:"none",xmlns:"http://www.w3.org/2000/svg"},[s("path",{d:"M2.5 7.65149V15.0757C2.5 15.4374 2.64367 15.7842 2.8994 16.04C3.15513 16.2957 3.50198 16.4394 3.86364 16.4394H16.1364C16.498 16.4394 16.8449 16.2957 17.1006 16.04C17.3563 15.7842 17.5 15.4374 17.5 15.0757V7.65149",stroke:"#74808B","stroke-miterlimit":"10","stroke-linecap":"square"}),s("path",{d:"M17.5 7.57572V5.53026C17.5 5.1686 17.3563 4.82176 17.1006 4.56603C16.8449 4.31029 16.498 4.16663 16.1364 4.16663H3.86364C3.50198 4.16663 3.15513 4.31029 2.8994 4.56603C2.64367 4.82176 2.5 5.1686 2.5 5.53026V7.57572L10 10.8333L17.5 7.57572Z",stroke:"#74808B","stroke-miterlimit":"10","stroke-linecap":"square"})])],-1),C={class:"mt-1"},_={class:"relative"},y=s("div",{class:"absolute inset-y-0 right-0 flex items-center px-2"},[s("svg",{class:"field-icon password-icon",width:"20",height:"20",viewBox:"0 0 20 20",fill:"none",xmlns:"http://www.w3.org/2000/svg"},[s("path",{"fill-rule":"evenodd","clip-rule":"evenodd",d:"M10.0961 1.93768H10.0264C8.94806 1.92763 7.90976 2.34591 7.13951 3.10075C6.36866 3.85619 5.9294 4.88687 5.91833 5.96612L5.91831 5.96612V5.97124V6.52695H4.3125C3.20793 6.52695 2.3125 7.42238 2.3125 8.52695V16.0165C2.3125 17.121 3.20793 18.0165 4.3125 18.0165H15.7356C16.8401 18.0165 17.7356 17.121 17.7356 16.0165V8.52695C17.7356 7.42238 16.8401 6.52695 15.7356 6.52695H14.1297V6.04576C14.1397 4.96742 13.7214 3.92913 12.9666 3.15888C12.2112 2.38803 11.1805 1.94877 10.1012 1.9377V1.93768H10.0961ZM13.1297 6.52695V6.04336V6.03838H13.1297C13.1378 5.22428 12.8222 4.44029 12.2524 3.85881C11.6831 3.27793 10.9067 2.94667 10.0934 2.93768H10.024H10.019V2.93765C9.20491 2.92955 8.42092 3.24512 7.83944 3.81497C7.25856 4.38423 6.9273 5.1607 6.91831 5.9739V6.52695H13.1297ZM4.3125 7.52695C3.76022 7.52695 3.3125 7.97467 3.3125 8.52695V16.0165C3.3125 16.5687 3.76022 17.0165 4.3125 17.0165H15.7356C16.2879 17.0165 16.7356 16.5687 16.7356 16.0165V8.52695C16.7356 7.97467 16.2879 7.52695 15.7356 7.52695H4.3125ZM10.0242 13.2384C10.5581 13.2384 10.9909 12.8056 10.9909 12.2717C10.9909 11.7377 10.5581 11.3049 10.0242 11.3049C9.49023 11.3049 9.05738 11.7377 9.05738 12.2717C9.05738 12.8056 9.49023 13.2384 10.0242 13.2384ZM11.9909 12.2717C11.9909 13.3579 11.1104 14.2384 10.0242 14.2384C8.93794 14.2384 8.05738 13.3579 8.05738 12.2717C8.05738 11.1854 8.93794 10.3049 10.0242 10.3049C11.1104 10.3049 11.9909 11.1854 11.9909 12.2717Z",fill:"#74808B"})])],-1),v=["type"],V={class:"absolute inset-y-0 left-0 flex items-center pl-3 text-sm leading-5"},k={key:0,class:"text-gray-400"},H={key:1,class:"text-gray-400"},M=["disabled"],B={key:0,class:"spinner-border spinner-border-sm"},P={key:1};function Z(l,e,q,i,I,L){return o(),r("div",f,[s("div",w,[s("div",g,[s("form",{class:"space-y-6",onSubmit:e[3]||(e[3]=u((...t)=>this.auth.login&&this.auth.login(...t),["prevent"]))},[s("div",x,[b,a(s("input",{name:"user_id","onUpdate:modelValue":e[0]||(e[0]=t=>this.auth.userId=t),required:"",class:"block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 pr-8 pl-10 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm",placeholder:"example@trilogy.com"},null,512),[[c,this.auth.userId]])]),s("div",C,[s("div",_,[y,a(s("input",{name:"currentPassword",type:this.auth.passwordFieldType,"onUpdate:modelValue":e[1]||(e[1]=t=>this.auth.currentPassword=t),required:"",placeholder:"•••••",class:"block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 pr-10 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"},null,8,v),[[h,this.auth.currentPassword]]),s("div",V,[s("button",{type:"button",class:"absolute inset-y-0 left-0 flex items-center pl-3 text-sm leading-5",onClick:e[2]||(e[2]=t=>this.auth.showPassword=!this.auth.showPassword)},[this.auth.showPassword?(o(),r("span",k,"إخفاء")):(o(),r("span",H,"إظهار"))])])])]),s("div",null,[s("button",{type:"submit",disabled:i.auth.loading||!this.auth.currentPassword&&!this.auth.userId,class:p([i.auth.loading||!this.auth.currentPassword&&!this.auth.userId?"cursor-not-allowed":"","flex w-full justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"])},[i.auth.loading?(o(),r("span",B,"جارٍ التحقق...")):(o(),r("span",P,"تسجيل الدخول"))],10,M)])],32)])])])}const D=n(m,[["render",Z]]);export{D as default};