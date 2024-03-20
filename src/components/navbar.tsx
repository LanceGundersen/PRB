import logo from '../assets/images/favicon-32x32.png'

function NavBar() {
  return (
    <div className="navbar bg-base-200">
      <div className="flex-1">
        <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar">
          <div className="w-10 rounded-full">
            <img alt="Tailwind CSS Navbar component" src={logo} />
          </div>
        </div>
        <p className='text-sm font-bold'>Product Recommendation Bot</p>
      </div>
      <div className="flex-none">
        <ul className="menu menu-horizontal px-1">
          <li><a>Search History</a></li>
        </ul>
      </div>
    </div>
  )
}

export default NavBar;