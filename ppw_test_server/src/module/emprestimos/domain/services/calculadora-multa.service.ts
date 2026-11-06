export interface ResultadoCalculoMulta {
  diasAtraso: number;
  valorMulta: number;
  descricaoCalculo: string;
}

export class CalculadoraMultaService {
  /**
   * Tabela progressiva de multas por dias de atraso (Tema 08):
   * - Até 3 dias: R$ 2,00 por dia
   * - De 4 a 7 dias: R$ 3,50 por dia
   * - A partir do 8º dia: R$ 5,00 por dia
   */
  static calcular(
    dataPrevista: Date | null | undefined,
    dataEfetiva: Date = new Date(),
  ): ResultadoCalculoMulta {
    if (!dataPrevista) {
      return { diasAtraso: 0, valorMulta: 0, descricaoCalculo: 'Sem data prevista definida.' };
    }

    const prevista = new Date(dataPrevista);
    const efetiva = new Date(dataEfetiva);

    // Se devolvido no prazo ou antes, multa zero
    if (efetiva <= prevista) {
      return { diasAtraso: 0, valorMulta: 0, descricaoCalculo: 'Devolução dentro do prazo.' };
    }

    const diferencaMs = efetiva.getTime() - prevista.getTime();
    const diasAtraso = Math.ceil(diferencaMs / (1000 * 60 * 60 * 24));

    if (diasAtraso <= 0) {
      return { diasAtraso: 0, valorMulta: 0, descricaoCalculo: 'Devolução dentro do prazo.' };
    }

    let valorTotal = 0;
    const detalhes: string[] = [];

    // Faixa 1: dias 1 a 3 (R$ 2,00/dia)
    const diasFaixa1 = Math.min(diasAtraso, 3);
    const valorFaixa1 = diasFaixa1 * 2.0;
    valorTotal += valorFaixa1;
    detalhes.push(`${diasFaixa1} dia(s) a R$ 2,00`);

    // Faixa 2: dias 4 a 7 (R$ 3,50/dia)
    if (diasAtraso > 3) {
      const diasFaixa2 = Math.min(diasAtraso - 3, 4);
      const valorFaixa2 = diasFaixa2 * 3.5;
      valorTotal += valorFaixa2;
      detalhes.push(`${diasFaixa2} dia(s) a R$ 3,50`);
    }

    // Faixa 3: dia 8 em diante (R$ 5,00/dia)
    if (diasAtraso > 7) {
      const diasFaixa3 = diasAtraso - 7;
      const valorFaixa3 = diasFaixa3 * 5.0;
      valorTotal += valorFaixa3;
      detalhes.push(`${diasFaixa3} dia(s) a R$ 5,00`);
    }

    const valorArredondado = Math.round(valorTotal * 100) / 100;
    const descricao = `Atraso de ${diasAtraso} dia(s): ${detalhes.join(' + ')} = R$ ${valorArredondado.toFixed(2)}`;

    return {
      diasAtraso,
      valorMulta: valorArredondado,
      descricaoCalculo: descricao,
    };
  }
}
