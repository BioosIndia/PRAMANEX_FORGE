import {env} from 'cloudflare:workers';
import {qualityAdapter} from '@/lib/quality-adapter';
import {authorizeQuality,runQualityMonitoring,readQualityMonitoring} from '@/lib/quality-monitor';
export const dynamic='force-dynamic';
export async function GET(){return readQualityMonitoring(env,qualityAdapter);}
