import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { useAuth } from '../../contexts/AuthContext';

function AppLayout({ children }) {
  const { currentUser } = useAuth();

  return (
    <div className="app-container">
      <Navbar user={currentUser} />
      <div className="main-content">
        <Sidebar />
        <div className="content-area">
          {children}
        </div>
      </div>
    </div>
  );
}

export default AppLayout;