import AccessGate from '../../features/AccessGate';
import SectionLayout from '../../components/SectionLayout';
import { navigation } from '../../lib/navigation';

export default function Layout({ children }) {
    return <AccessGate role="patient"><SectionLayout title="Patient" items={navigation.patient}>{children}</SectionLayout></AccessGate>;
}
