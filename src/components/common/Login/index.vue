<script lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElCard } from 'element-plus'
import { fetchLogin, fetchRegister, getCaptcha } from '@/store/modules/user/helper'
import { setToken } from '@/store/modules/user/token'

export default {
  name: 'AppLogin',
  components: {
    ElCard,
  },
  setup() {
    const userLoginForm = reactive({
      username: '',
      password: '',
			captcha: '',
      uuid: '',
    })

    const error = ref('')
    const captchaUrl = ref('')
    const router = useRouter()

    // 获取验证码图片
    async function refreshCaptcha() {
      const { data } = await getCaptcha()
      // const captchaUrl = `data:image/gif;base64,${data.img}`
      userLoginForm.uuid = data.uuid
			// 将SVG数据作为字符串分配给captchaUrl
			captchaUrl.value = `data:image/svg+xml,${encodeURIComponent(data.img)}`
    }

    // 	用户登录
    async function userLogin() {
			try {
				error.value = ''
				const zResponse = await fetchLogin({
					username: userLoginForm.username,
					password: userLoginForm.password,
					captcha: userLoginForm.captcha,
					uuid: userLoginForm.uuid,
				})
				const data = zResponse.data
				if (data.code === 200) {
					setToken(data.token);
					// 跳转到/chat页面
					router.push("/chat");
				} else {
					error.value = data.msg || "登录失败，请重试";
				}
			} catch (err) {
				console.error(err);
				error.value = "登录失败，请重试";
			}
    }

    // 	用户注册
    async function userRegister() {
			try {
				error.value = ''
				const zResponse = await fetchRegister({
					username: userLoginForm.username,
					password: userLoginForm.password,
					captcha: userLoginForm.captcha,
					uuid: userLoginForm.uuid,
				})
				const data = zResponse.data
				if (data.code === 200) {
					setToken(data.token);
					// 跳转到/chat页面
					router.push("/chat");
				} else {
					error.value = data.msg || "登录失败，请重试";
				}
			} catch (err) {
				console.error(err);
				error.value = "注册失败，请重试";
			}
    }

    // 初始化获取验证码图片
    onMounted(refreshCaptcha)

    // // 在组件销毁时释放图片的 URL
    // onUnmounted(() => {
    //  URL.revokeObjectURL(captchaUrl.value)
    // })

    return {
      userLoginForm,
      error,
      captchaUrl,
      refreshCaptcha,
      userLogin,
			userRegister,
    }
  },
  mounted() {

  },
}
</script>

<template>
  <div id="login">
    <div id="contain">
      <div id="left_card">
        <h1>欢迎来到 GPT</h1>
        <span>Welcome to GPT</span>
      </div>
      <div id="right_card">
        <ElCard class="el-card">
          <h2>欢迎登录</h2>
          <form class="login" action="">
            <input v-model="userLoginForm.username" v-shake type="text" placeholder="请输入账号">
            <input v-model="userLoginForm.password" v-shake type="password" placeholder="请输入密码">
            <div class="captcha">
              <input v-model="userLoginForm.captcha" type="text" placeholder="请输入验证码">
							<div class="captcha-img-wrapper">
								<img id="captcha-img" :src="captchaUrl" @click="refreshCaptcha">
							</div>
            </div>
          </form>
          <div class="remember">
            <input id="psd" type="radio" name="" class="radio"><label for="psd" />记住密码
          </div>
          <div class="message">
            <span v-html="error" />
          </div>
					<div id="btn">
						<button class="loginbtn" @click="userLogin">
							登陆
						</button>
						<button class="loginbtn" @click="userRegister">
              注册
						</button>
          </div>
        </ElCard>
      </div>
    </div>
  </div>
</template>

<style lang="less" scoped>
 @keyframes animate {
  0% {
   filter: hue-rotate(0deg);
  }
  100% {
   filter: hue-rotate(360deg);
  }
 }
 #login {
  position: relative;
  width: 100vw;
  height: 100vh;
  background-image: url('./src/assets/login/001.gif');
  background-size: 100% 100%;
  background-color: #a7a8bd;
  #contain {
   height: 400px;
   position: absolute;
   top: 50%;
   left: 50%;
   transform: translate(-50%, -50%);
   border-radius: 25px;
   border: 1px solid black;
   background-color: rgba(255, 255, 255, 0.1) !important;
   backdrop-filter: blur(5px);
   box-shadow: -5px -5px 10px rgb(39, 65, 65), 5px 5px 20px aqua;
   /* 5秒 infinite循环播放无限次 linear匀速 */
   animation: animate 5s linear infinite;
  }
 }
 #contain {
  display: flex;
  flex-direction: row;
  text-align: center;
  align-items: center;
  #left_card {
   width: 500px;
   h1 {
    color: white;
    white-space: nowrap;
   }
   span {
    font-size: 1.2rem;
    text-align: center;
    color: white;
    white-space: nowrap;
   }
  }
  #right_card {
   width: 400px;
   .el-card {
    margin: 0 45px;
    border-radius: 25px;
    background-color: rgba(255, 255, 255, 0.1);
   }
  }
 }
 #right_card {
  display: flex;
  justify-content: center;
  align-items: center;
  h2 {
   margin-bottom: 5px;
  }
  .remember {
   float: right;
   height: 26px;
   text-align: center;
   font-size: 1rem;
   position: relative;
   .radio {
    height: 1rem;
    width: 1rem;
    vertical-align: middle;
    margin-top: -2px;
    opacity: 0;
   }
   label {
    position: absolute;
    left: -2px;
    top: 5px;
    height: 1rem;
    width: 1rem;
    vertical-align: middle;
    margin-top: -2px;
    border-radius: 50%;
    border: 1px solid black;
   }

   /* radio选中后修改labe内的内容 :after 选择器在被选元素的内容后面插入内容。 */
   input:checked + label::after {
    content: '';
    width: 0.6rem;
    height: 0.6rem;
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    border-radius: 50%;
    background-color: rgba(207, 38, 38, 0.8);
    border: 1px solid rgba(207, 38, 38, 0.8);
   }
  }
  .message {
   margin-top: 26px;
   font-size: 0.9rem;
   color: red;
  }
  .loginbtn {
   width: 100%;
   height: 35px;
   margin-top: 10px;
   border-radius: 10px;
   background-color: rgba(207, 38, 38, 0.8);
  }
  .login {
   input {
    width: 80%;
    height: 45px;
    margin-top: 10px;
    border: 1px solid white;
    background-color: rgba(255, 255, 255, 0.5);
    border-radius: 10px;
    font-size: inherit;
    padding-left: 20px;
    outline: none;
   }
  }
  .login .captcha {
   height: 45px;
   display: flex;
   align-items: center;
   justify-content: center; /* 添加水平居中对齐 */
   margin-top: 5px;
   width: 80%;
   border-radius: 10px;
   padding-left: 20px;
   margin-bottom: 5px;
  }
  .login .captcha input {
   width: 100%; /* 让输入框占据剩余空间 */
   height: 100%; /* 让输入框的高度与父元素一样 */
   margin-left: 10px;
  }
  .login .captcha-img-wrapper {
   width: 120px;
   height: 40px; /* 设置验证码图片的高度与输入框一样 */
   display: flex; /* 将其包裹在一个flex容器中 */
   align-items: center; /* 垂直居中对齐 */
   justify-content: right; /* 水平居中对齐 */
   padding-left: 10px;
   margin-top: 10px;
  }
  .captcha .captcha-img-wrapper img {
   width: 100%;
   height: 100%;
   cursor: pointer;
  }

 }
</style>
