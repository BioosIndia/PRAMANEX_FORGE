/** Values stay server-side; configuration is not successful execution. */
export function providerConfig(env={}){if(env.GROQ_API_KEY)return {provider:'groq',apiKey:env.GROQ_API_KEY,model:env.FORGE_MODEL||env.GROQ_MODEL||'openai/gpt-oss-20b',reviewerModel:env.FORGE_REVIEWER_MODEL||env.GROQ_REVIEWER_MODEL||'openai/gpt-oss-120b',visionModel:env.FORGE_VISION_MODEL||env.GROQ_VISION_MODEL};return {provider:'openai',apiKey:env.OPENAI_API_KEY,model:env.FORGE_MODEL,reviewerModel:env.FORGE_REVIEWER_MODEL,visionModel:env.FORGE_VISION_MODEL};}
export function firecrawlKey(env={}){return env.FIRECRAWL_API_KEY||env.FIRECRAWL_KEY||env.FIRECRAWL;}
export function providerConfigured(env={}){const c=providerConfig(env);return Boolean(c.apiKey&&c.model&&c.reviewerModel&&c.model!==c.reviewerModel);}
