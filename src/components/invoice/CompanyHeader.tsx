export const CompanyHeader = () => {
  return (
    <div className="text-center mb-6 p-4 border-b">
      <img
        src="/logo_cardoso.svg"
        alt="Cardoso Aluguel de Muletas"
        className="w-48 mx-auto"
      />
      <p className="text-sm text-muted-foreground mt-1">
        Quadra 207, Lote 4, Residencial Imprensa IV, Águas Claras
      </p>
      <p className="text-sm text-muted-foreground">
        Brasília Distrito Federal 71926250
      </p>
      <p className="text-sm text-muted-foreground">CNPJ: 57.684.914/0001-36</p>
      <p className="text-sm text-muted-foreground">
        cardosoalugueldemuletas@gmail.com
      </p>
    </div>
  );
};
