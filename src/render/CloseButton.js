export function CloseButton ({ onClick, title = 'Close' }) {
  return (
    <img
      className='pointer grow'
      src='icon/icon-cross.svg'
      onClick={onClick}
      alt='Close button'
      style={{ width: 25, height: 25 }}
      title={title}
    />
  )
}
