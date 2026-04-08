interface StatsCardProps{
  label:string;
  value:string| number;
  sub?:string;
  up?:boolean
}

export default function StatsCard({label,value,sub,up}:StatsCardProps){
  const valueColor=
  up ===true ?"text-[#00ff88]":
  up=== false?"text-red-400":
  "text-white"


return(
   <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 flex flex-col gap-1">
      <p className="text-[10px] font-medium tracking-[0.14em] uppercase text-zinc-500">
        {label}
      </p>
      <p className={`font-mono text-xl font-bold tracking-tight ${valueColor}`}>
        {value}
      </p>
      {sub && (
        <p className="text-xs text-zinc-600 font-mono">{sub}</p>
      )}
    </div>
  );

}