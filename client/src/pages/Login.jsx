import React, { useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { setUser } from '../../redux/user.slice'

const Login = () => {
  const dispatch = useDispatch();
  const loginButtonRef = useRef()
  const [passVisible, setPasswordVisible] = useState(false)
  const [warning, setWarning] = useState(null)
  const hadleLogin = async e => {
    loginButtonRef.current.innerHTML = "Please wait..."
    loginButtonRef.current.disabled = true
    e.preventDefault();
    const formdata = new FormData(e.target);
    const payload = {}
    for (let key of formdata.keys()) {
      payload[key] = formdata.get(key)
    }
    const req = await fetch(`${import.meta.env.VITE_SERVER}/login`, {
      method: "post",
      body: JSON.stringify(payload),
      credentials: "include",
      headers: {
        "content-type": "application/json"
      }
    })
    const res = await req.json()
    if (res.error) {
      setWarning(res.message)
    }
    if (!res.error) {
      setWarning(null)
      dispatch(setUser({ ...res?.user, name: res?.user?.fname }))
      localStorage.setItem("user", JSON.stringify({ ...res?.user, name: res?.user?.fname + " " + res?.user?.lname }));
      
    }
    loginButtonRef.current.innerHTML = "Login"
    loginButtonRef.current.disabled = false
  }
  return (
    <section className='h-full w-full flex '>
      {/* heading */}
      <section className='w-[40%] text-white bg-primary md:inline-block hidden h-full px-8 py-16'>
        <h1 className='font-black mx-auto w-[70%] text-6xl'>Welcome to Rsquare.</h1>
        <p className='py-6  w-[70%] mx-auto'>Lets get you all set to start up with your account and begin setting up your profile</p>
      </section>
      {/* form */}
      <section className='py-16 px-6 md:px-16 mx-auto md:w-[60%]'>
        <h2 className='text-4xl font-bold'>Welcome back</h2>
        <p className='text-slate-500 font-medium py-4'>Please enter your details</p>

        <form onSubmit={hadleLogin} className='w-full mt-8  md:w-[80%]  flex-wrap'>
          {
            warning &&
            <p className='text-red-500 p-2 max-w-[320px] bg-red-100 rounded-md text-sm font-medium '>{warning}</p>
          }
          <div className='formGroup group'>

            <label htmlFor="fname" className='group-hover:text-primary text-sm font-medium w-max'>Email Address*</label>
            <input type="text" id='fname' required name="email" className='py-2 px-4 mt-1 border rounded-md flex-1 accent-primary focus:outline-primary' />
          </div>

          <div className='formGroup group'>
            <label htmlFor="pass" className='group-hover:text-primary text-sm font-medium'>Password*</label>
            <div className='relative min-w-[230px]'>
              <input required type={passVisible ? "text" : "password"} id='pass' name="password" className=' w-full py-2 px-4 mt-1 border rounded-md flex-1 pr-6 accent-primary focus:outline-primary' />
              <i className="fa-solid absolute right-2 fa-eye top-[50%] -translate-y-[30%] text-slate-500 cursor-pointer" onClick={() => setPasswordVisible(!passVisible)}></i>
            </div>
          </div>
          <div className='formGroup w-full md:w-[50%] flex-row items-center justify-between'>
            <span className='flex items-center  px-2'>
              <input type="checkbox" name="aggreement" id="terms" className='w-4 h-4' />
              <label htmlFor='terms' className='mx-1 text-sm md:w-max'>Remember me</label>
            </span>
            <Link to="forgot" className='text-primary text-sm px-2'>Forgot password ? </Link>
          </div>

          <button className='py-3 px-6 bg-primary mt-10 rounded-md text-white w-full  md:w-[50%]' ref={loginButtonRef}>Login</button>
          <p className='w-full text-sm py-2'>Create new account ? <Link to="/signup" className='text-primary'>Signup</Link></p>
        </form>
      </section>
    </section>
  )
}

export default Login