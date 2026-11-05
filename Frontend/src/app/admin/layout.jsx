import AccessGate from '../../features/AccessGate';
import SectionLayout from '../../components/SectionLayout';
import { navigation } from '../../lib/navigation';

export default function Layout({ children }) {
    return <AccessGate role="admin"><SectionLayout title="Admin" items={navigation.admin}>{children}</SectionLayout></AccessGate>;
}
