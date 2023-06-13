let x = `<div>
   What is the order of the output, and why?
</div><pre class="code-block">console.log('A');
new Promise((resolve, reject) =&gt; {
    console.log('B');
}).then(() =&gt; {
    console.log('C');
});

console.log('D');
</pre>`;
x;
