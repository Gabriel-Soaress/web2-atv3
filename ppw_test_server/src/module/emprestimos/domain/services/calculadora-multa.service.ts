export interface ResultadoCalculoMulta {
  diasAtraso: number;
  valorMulta: number;
  descricaoCalculo: string;
}

/**
 * CalculadoraMultaService
 *
 * Domain Service (Serviço de Domínio) puro e desacoplado de infraestrutura.
 * Implementa a regra de negócio da tabela progressiva de multas por atraso (Tema 08):
 * - Faixa 1 (1 a 3 dias): R$ 2,00 por dia
 * - Faixa 2 (4 a 7 dias): R$ 3,50 por dia
 * - Faixa 3 (8º dia em diante): R$ 5,00 por dia
 */
export class CalculadoraMultaService {
  /**
   * calcular()
   *
   * Realiza o cálculo progressivo de dias de atraso e valor total da multa
   * comparando a data prevista de devolução com a data em que a devolução ocorreu ou está sendo consultada.
   * Se a devolução for no prazo ou antes, retorna atraso zero e multa zerada.
   *
   * @param dataPrevista - Data e hora originalmente combinadas para devolução do item.
   * @param dataEfetiva - Data e hora efetiva da devolução (padrão: data/hora atual).
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

    const diasFaixa1 = Math.min(diasAtraso, 3);
    const valorFaixa1 = diasFaixa1 * 2.0;
    valorTotal += valorFaixa1;
    detalhes.push(`${diasFaixa1} dia(s) a R$ 2,00`);

    if (diasAtraso > 3) {
      const diasFaixa2 = Math.min(diasAtraso - 3, 4);
      const valorFaixa2 = diasFaixa2 * 3.5;
      valorTotal += valorFaixa2;
      detalhes.push(`${diasFaixa2} dia(s) a R$ 3,50`);
    }

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
