class TableCenter {
   constructor(private game: DaleMerchants) {
      const html = `
         <div id="table-center-background"></div>
      `;

      dojo.place(html, "table-center");
   }
}
