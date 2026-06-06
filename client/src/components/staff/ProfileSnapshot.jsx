export default function ProfileSnapshot({ profile = {} }) {
  const fields = [
    ['Date of Birth', profile.dateOfBirth],
    ['Gender', profile.gender],
    ['Class', profile.classLevel],
    ['Stream', profile.stream],
    ['Board', profile.board],
    ['City', profile.city],
    ['State', profile.state],
    ['School / College', profile.schoolOrCollege],
    ['Career Goal', profile.careerGoal],
    ['Hobbies', profile.hobbies],
    ['Challenge', profile.biggestChallenge],
    ['Parent', profile.parentName],
    ['Parent Phone', profile.parentPhone],
    ['Counselling Mode', profile.preferredMode],
    ['How Found Us', profile.howHeard],
  ].filter(([, v]) => v);
  if (!fields.length) return <p className="text-xs opacity-60 mt-2">No profile details captured at booking</p>;
  return (
    <div className="mt-3 pt-3 border-t border-sand-200/50 dark:border-sand-700/40">
      <p className="text-[10px] font-bold uppercase tracking-wide opacity-50 mb-2">Student profile (at booking)</p>
      <div className="grid sm:grid-cols-2 gap-1.5">
        {fields.map(([label, val]) => (
          <p key={label} className="text-xs"><span className="font-semibold opacity-70">{label}:</span> {val}</p>
        ))}
      </div>
    </div>
  );
}
