import type {Metadata} from 'next';
export const metadata:Metadata={title:'Pulso — Gestão por resultados',description:'Gestão de indicadores de startups com acesso por e-mail e dados na nuvem.'};
export default function Layout({children}:Readonly<{children:React.ReactNode}>){return <html lang="pt-BR"><body style={{margin:0}}>{children}</body></html>;}
