Phaser.LinkedList.prototype.iterate = function (callback) {
    if (!this.first || !this.last)
    {
        return;
    }

    var entity = this.first;
    var prev = null;
    do
    {
        if (entity && callback)
        {
            var result = callback.call(window, entity);
            //remove node if callback returns false
            if (result === false) {
                prev.next = entity.next;
                entity = entity.next;
                continue;
            }
        }
        prev = entity;
        entity = entity.next;
    }
    while(entity != this.last.next);

}
