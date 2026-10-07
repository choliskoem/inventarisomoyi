import { redirect } from 'next/navigation';
import { DEFAULT_REDIRECT } from '@/lib/config';

export default function HomePage() {
  redirect(DEFAULT_REDIRECT);
}