import {requireChatGPTUser} from '../chatgpt-auth';
import PartnerPortal from '../PartnerPortal';
export const dynamic='force-dynamic';
export default async function Page(){const user=await requireChatGPTUser('/collaboration');return <PartnerPortal userName={user.displayName} userId={user.userId}/>}
