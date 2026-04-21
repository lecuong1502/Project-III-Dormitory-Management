import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

const MainLayout = () => (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
        <Sidebar />
        <main style={{
            marginLeft: 'var(--sidebar-width)',
            flex: 1,
            padding: 28,
            minHeight: '100vh',
            background: 'var(--bg)',
        }}>
            <Outlet />
        </main>
    </div>
);

export default MainLayout;