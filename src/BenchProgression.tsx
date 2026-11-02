import React from 'react';
import type {WeeklyProgress,BenchPlanPoint} from './performance';

type Point={week:number;weight:number};
const pounds=(value:number)=>value.toLocaleString(undefined,{maximumFractionDigits:1})+' lb';

export default function BenchProgression({weeks,plan}:{weeks:WeeklyProgress[];plan:BenchPlanPoint[]}){
 const actual=weeks.flatMap(week=>week.benchLoad===null?[]:[{week:week.week,weight:week.benchLoad}]);
 if(!actual.length)return null;
 const planned=plan.filter((point):point is Point=>point.weight!==null);
 const latest=actual[actual.length-1];
 const actualByWeek=new Map(actual.map(point=>[point.week,point.weight]));
 const highest=Math.max(...planned.map(point=>point.weight),...actual.map(point=>point.weight));
 const ceiling=Math.max(300,Math.ceil((highest+20)/100)*100);
 const left=32,right=650,top=20,bottom=340;
 const x=(week:number)=>left+(week-1)*(right-left)/9;
 const y=(weight:number)=>bottom-weight/ceiling*(bottom-top);
 // Do not connect a prescribed series across weeks with no active bench prescription.
 const segments=planned.reduce<Point[][]>((groups,point)=>{
  const last=groups[groups.length-1];
  if(last&&last[last.length-1].week===point.week-1)last.push(point);else groups.push([point]);
  return groups;
 },[]);
 const anchor=(week:number):'start'|'end'|'middle'=>week===10?'end':'middle';
 const description=`Bench progression. Plan: ${planned.map(point=>`Week ${point.week}: ${pounds(point.weight)}`).join('; ')}. Actual: ${actual.map(point=>`Week ${point.week}: ${pounds(point.weight)}`).join('; ')}.`;
 return <section className="bench-progression">
  <h3 className="bench-title">Bench progression · lb</h3>
  <div className="bench-card">
   <h2>Current recorded weight: {pounds(latest.weight)} · Week {latest.week}</h2>
   <div className="bench-chart-wrap">
    <svg viewBox="0 0 720 385" role="img" aria-label={description}>
     {Array.from({length:ceiling/100+1},(_,i)=>i*100).map(tick=><g key={tick}><line x1={left} x2={right} y1={y(tick)} y2={y(tick)} className="bench-horizontal"/><text x={right+12} y={y(tick)+5} className="bench-axis">{tick}</text></g>)}
     {Array.from({length:10},(_,i)=>i+1).map(week=><g key={week}><line x1={x(week)} x2={x(week)} y1={top} y2={bottom+8} className="bench-vertical"/><text x={x(week)} y={bottom+29} textAnchor="middle" className="bench-axis">{week}</text></g>)}
     {segments.map((segment,i)=><polyline key={i} points={segment.map(point=>`${x(point.week)},${y(point.weight)}`).join(' ')} className="bench-plan-line"/>)}
     {planned.map(point=><g key={point.week}><title>{`Plan · Week ${point.week}: ${pounds(point.weight)}`}</title><circle cx={x(point.week)} cy={y(point.weight)} r="5" className="bench-plan-point"/><text x={x(point.week)} y={y(point.weight)+25} textAnchor={anchor(point.week)} className="bench-weight">{pounds(point.weight)}</text></g>)}
     {actual.map(point=><g key={point.week}><title>{`Actual · Week ${point.week}: ${pounds(point.weight)}`}</title><circle cx={x(point.week)} cy={y(point.weight)} r="6" className="bench-actual-point"/><text x={x(point.week)} y={y(point.weight)-20} textAnchor={anchor(point.week)} className="bench-weight">{pounds(point.weight)}</text></g>)}
    </svg>
   </div>
   <div className="bench-legend" aria-label="Chart legend"><span><i className="bench-plan-dot"/>Plan</span><span><i className="bench-actual-dot"/>Actual</span></div>
   <p className="bench-description">Highest prescribed and completed load each week across heavy bench, volume bench, readiness single and goal attempt. Substitutions stay separate.</p>
   <details><summary>View chart data</summary><table><thead><tr><th scope="col">Week</th><th scope="col">Plan · lb</th><th scope="col">Actual · lb</th></tr></thead><tbody>{plan.map(point=><tr key={point.week}><th scope="row">{point.week}</th><td>{point.weight===null?'—':pounds(point.weight)}</td><td>{actualByWeek.has(point.week)?pounds(actualByWeek.get(point.week)!):'—'}</td></tr>)}</tbody></table></details>
  </div>
 </section>;
}
