// Move to Server

function HardRandom ()
{
    const num = new Uint32Array(1);
    window.crypto.getRandomValues(num);
    return 100 * (num[0] / (0x100000000));
}

class LootItem
{
    id = "";
    chance = 0;
    biteDuration = 0;

    cummulativeWeight = 0;

    constructor (id, chance, biteDuration)
    {
        this.id = id;
        this.chance = chance;
        this.biteDuration = biteDuration;
    }
}

class LootTable
{
    static #totalWeight = 0;
    static #items = [];

    static Get (value)
    {
        if (this.#totalWeight === 0) return null;

        const threshold = 0.01 * value * this.#totalWeight;

        let sLeft = 0
        let sRight = this.#items.length - 1;
        let output = null;

        while (sLeft <= sRight)
        {
            const sMid = sLeft + Math.floor(0.5 * (sRight - sLeft));

            if (threshold <= this.#items[sMid].cummulativeWeight)
            {
                sRight = sMid - 1;
                output = this.#items[sMid];
            }
            else sLeft = sMid + 1;
        }

        return output;
    }

    static Add (item)
    {
        this.#totalWeight += item.chance;
        item.cummulativeWeight = this.#totalWeight;
        this.#items.push(item);
    }

    static Remove (itemID)
    {
        const item = this.#items.find(item => item.id === itemID);

        if (item == null) return;

        const index = this.#items.indexOf(item);
        this.#items.splice(index, 1);

        this.#totalWeight = item.cummulativeWeight - item.chance;
        
        for (let i = index; i < this.#items.length; i++)
        {
            const currentItem = this.#items[i];
            this.#totalWeight += currentItem.chance;
            currentItem.cummulativeWeight = this.#totalWeight;
        }
    }
}

LootTable.Add(new LootItem("tae", 40, 3));
LootTable.Add(new LootItem("tilapia", 60, 6));

class Caster
{
    static #biteTime = 0;
    static #casted = null;

    static HasBit ()
    {
        return this.#biteTime >= this.#casted.biteDuration;
    }

    static GetCaught ()
    {
        if (!this.HasBit()) return null;

        return this.#casted?.id;
    }

    static Cast ()
    {
        if (this.#casted != null) return;
        this.#casted = LootTable.Get(HardRandom());
    }

    static Reset ()
    {
        this.#casted = null;
        this.#biteTime = 0;
    }

    static Update ()
    {
        if (this.#casted == null) return;
        if (this.HasBit()) return;
        
        this.#biteTime += Time.deltaTime;
    }
}