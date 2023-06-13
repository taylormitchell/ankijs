const includeResolve = get("includeResolve", shuffle([true, false])[0]);
const vals = get("vals", shuffle(["A", "B", "C", "D"]));
set("displayVals", vals.slice(0, includeResolve ? 4 : 3));
const resName = get("resName", shuffle(["res", "resolve"])[0]);
`
<div>
   What is the order of the output, and why?
</div>
<pre class="code-block">
console.log('${vals[0]}');
new Promise((${resName}) => {
    console.log('${vals[1]}'); ${
  includeResolve
    ? `
    ${resName}();`
    : ""
}
}).then(() =&gt; {
    console.log('${vals[3]}');
});
console.log('${vals[2]}');
</pre>`;
