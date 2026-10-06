import {requireChatGPTUser} from '../chatgpt-auth';
import Workspace from '../Workspace';
export const dynamic='force-dynamic';
export default async function Page(){const u=await requireChatGPTUser('/app');return <Workspace userName={u.displayName} userId={u.userId}/>;}
