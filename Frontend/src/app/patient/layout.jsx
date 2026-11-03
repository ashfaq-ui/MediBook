import SectionLayout from '../../components/SectionLayout';
import { navigation } from '../../lib/navigation';

export default function Layout({ children }) {
    return <SectionLayout title="Patient" items={navigation.patient}>{children}</SectionLayout>;
}
