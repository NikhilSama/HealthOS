jQuery.fn.wrapInChunks = function(html, chunkSize) {

    chunkSize = chunkSize || 1;

    var items = this.get(),
        rows = [],
        cur = rows[0] = $(html);

    while (items[0]) {

        if (rows[rows.length - 1].children().length === chunkSize) {
            cur = rows[rows.length] = $(html);
        }

        cur.append( items.shift() );

    }

    return this.pushStack(rows);

};