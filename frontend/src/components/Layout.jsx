import Sidebar from "./Sidebar"
import Header from "./Header"
import "./Layout.css"

const Layout = ({ children, user }) => {
  return (
    <div className="layout">
      <Sidebar user={user} />
      <div className="main-content">
        <Header user={user} />
        <div className="content">{children}</div>
      </div>
    </div>
  )
}

export default Layout
