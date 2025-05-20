<script>
    const finances = [
        ["BUY", "Ionos Linux VPS for proxy ($2/month)", 2 * 19],
        ["BUY", "Buy vxsacademy.org domain", 12],
        ["BUY", "Old workstation for server", 86.75],
        ["BUY", "1TB SATA SSD for database", 42.89],
        ["SELL", "Old workstation because it's slow", 19.74],
        ["BUY", "Newer workstation for server", 77.78],
        ["SELL", "4GB DDR4-2400 RAM from newer server", 1.69],
        ["BUY", "16GB DDR4-3200 RAM for server", 39.03],
        ["BUY", "Renew vxsacademy.org domain", 12],
    ];

    let total = 0;
    let rowDatas = [];
    finances.forEach(row => {
        let amt = row[2];
        if (row[0] === "BUY") {
            amt = -amt;
        }
        total += amt;

        rowDatas.push({
            action: row[0],
            description: row[1],
            cost: amt > 0 ? "+" + amt.toFixed(2) : amt.toFixed(2)
        });
    });

</script>

<h1>Finances</h1>

<table id="finances">
    <thead>
        <tr>
            <th>Item</th>
            <th>Cost (USD)</th>
        </tr>
    </thead>
    <tbody>
        {#each rowDatas as rowData}
            <tr>
                <td>{rowData.action} {rowData.description}</td>
                <td>{rowData.cost}</td>
            </tr>
        {/each}
        <tr>
            <td>TOTAL:</td>
            <td>{total.toFixed(2)}</td>
        </tr>
    </tbody>
</table>

<style>
    :global(#page-middle-container) {
        margin: 20px;
    }

    table {
        font-family: arial, sans-serif;
        border-collapse: collapse;
        width: 100%;
    }

    td, th {
        border: 1px solid var(--borders4);
        text-align: left;
        padding: 8px;
    }

    tr:nth-child(even) {
        background-color: var(--background3);
    }
</style>