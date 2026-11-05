import AccessGate from '../../features/AccessGate';
import SectionLayout from '../../components/SectionLayout';
import { navigation } from '../../lib/navigation';

export default function Layout({ children }) {
    return <AccessGate role="doctor"><SectionLayout title="Doctor" items={navigation.doctor}>{children}</SectionLayout></AccessGate>;
}
