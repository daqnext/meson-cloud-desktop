export function Layout ({ children }) {
  return (
    <div className='flex items-center vh-100'>
      <div className='flex-none'>
        <img src='icon/logo.png' width='256' className='ma4 mr0' alt='logo' />
      </div>
      <div className='flex-auto h-100 flex'>
        {children}
      </div>
    </div>
  )
}
