class TestStaticMethodClass {
        
    public static readonly PI = 3.14;
    static calculateArea(radius:number) {
        return this.PI * radius * radius;
    }
}
