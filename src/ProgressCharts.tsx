import React,{useMemo} from 'react';
import type {WorkoutLog} from './types';
import {weeklyProgress,type WeeklyProgress} from './performance';
import './progress.css';

type Metric='benchLoad'|'estimatedMax'|'volume'|'averageRPE';
const format=(value:number,metric:Metric)=>value.toLocaleString(undefined,{maximumFractionDigits:metric==='estimatedMax'?0:1});
function MetricChart({title,metric,weeks,unit}:{title:string;metric:Metric;weeks:WeeklyProgress[];unit:string}){
 const points=weeks.flatMap(week=>week[metric]===null?[]:[{week:week.week,value:week[metric]!}]);
 if(!points.length)return null;
 const latest=points[points.length-1],highest=Math.max(...points.map(point=>point.value));
 const ceiling=metric==='averageRPE'?10:metric==='volume'?Math.max(1000,Math.ceil(highest/1000)*1000):Math.max(100,Math.ceil(highest/100)*100);
 const width=560,left=62,right=18,top=32,bottom=170,span=(width-left-right)/10;
 const ticks=[0,ceiling/2,ceiling];
 return <section className="exercise progress-metric">
  <h3>{title}</h3><small>CURRENT RECORDED VALUE</small>
  <h2>{format(latest.value,metric)}{unit?' '+unit:''} <span>· Week {latest.week}</span></h2>
  <div className="progress-plot">
   <svg viewBox={`0 0 ${width} 208`} role="img" aria-label={`${title}: ${points.map(point=>`Week ${point.week}: ${format(point.value,metric)} ${unit}`).join('; ')}`}>
    {ticks.map(tick=>{const y=bottom-tick/ceiling*(bottom-top);return <g key={tick}><line x1={left} x2={width-right} y1={y} y2={y} className="progress-grid"/><text x={left-8} y={y+4} textAnchor="end" className="progress-axis">{format(tick,metric)}</text></g>})}
    {Array.from({length:10},(_,i)=><text key={i} x={left+span*(i+.5)} y="195" textAnchor="middle" className="progress-axis">W{i+1}</text>)}
    {points.map(point=>{const x=left+span*(point.week-.5),height=point.value/ceiling*(bottom-top);return <g key={point.week}><title>{`Week ${point.week}: ${format(point.value,metric)} ${unit}`}</title>{metric==='benchLoad'?<circle cx={x} cy={bottom-height} r="5" className="progress-bar"/>:<rect x={x-span*.3} y={bottom-height} width={span*.6} height={height} rx="3" className="progress-bar"/>}<text x={x} y={bottom-height-8} textAnchor="middle" className="progress-value">{format(point.value,metric)}</text></g>})}
   </svg>
  </div>
  <details><summary>View chart data</summary><table><thead><tr><th scope="col">Week</th><th scope="col">{unit||'RPE'}</th></tr></thead><tbody>{points.map(point=><tr key={point.week}><th scope="row">{point.week}</th><td>{format(point.value,metric)}</td></tr>)}</tbody></table></details>
  {metric==='benchLoad'&&<p className="progress-note">Highest completed load each week across heavy bench, volume bench, readiness single and goal attempt. Substitutions stay separate.</p>}
 </section>;
}

export default function ProgressCharts({logs,userId}:{logs:WorkoutLog[];userId:string}){
 const weeks=useMemo(()=>weeklyProgress(logs,userId),[logs,userId]);
 if(!weeks.length)return null;
 return <div className="progress-summary-charts">
  <MetricChart title="Bench progression · lb" metric="benchLoad" weeks={weeks} unit="lb"/>
  <MetricChart title="Bench estimated 1RM · lb" metric="estimatedMax" weeks={weeks} unit="lb"/>
  <MetricChart title="Working volume · lb × reps" metric="volume" weeks={weeks} unit="lb × reps"/>
  <MetricChart title="Average actual RPE" metric="averageRPE" weeks={weeks} unit=""/>
  <p className="progress-note">Completed working sets only. Missing weeks have no data point. Dumbbell volume counts both arms; warm-ups, deleted sets and timed/distance movements are excluded from lifting volume. Estimated maxes use 1–10 reps and discard decimals without rounding up.</p>
 </div>;
}
