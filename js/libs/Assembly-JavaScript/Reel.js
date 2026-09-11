class Reel extends GameBehavior
{
    Update ()
    {
        const pos = Vector2.Subtract(
            CursorInput.screenPos,
            this.transform.localPosition
        );

        this.transform.rotation = 180 * Math.atan2(pos.y, pos.x) / Math.PI;
    }
}