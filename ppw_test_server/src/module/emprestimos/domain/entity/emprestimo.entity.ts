import { BaseEntity, DefaulTimeStampsProps } from '../../../../shared/domain/entity/base.entity';
import { StatusEmprestimo, StatusEmprestimoEnum } from '../value-objects/status-emprestimo.value-object';

export type EmprestimoProps = {
  id?: string;
  tituloItem: string;
  tipoItem: string;
  usuarioNome: string;
  dataReserva: Date;
  dataRetirada?: Date | null;
  dataPrevistaDevolucao?: Date | null;
  dataDevolucao?: Date | null;
  status: StatusEmprestimo;
  renovacoesCount: number;
  temAvaria: boolean;
  descricaoAvaria?: string | null;
} & DefaulTimeStampsProps;

export class EmprestimoEntity extends BaseEntity<EmprestimoProps> {
  constructor(props: EmprestimoProps) {
    super(props);
  }

  static createReserva(
    tituloItem: string,
    tipoItem: string,
    usuarioNome: string,
    id?: string,
  ): EmprestimoEntity {
    if (!tituloItem?.trim() || !tipoItem?.trim() || !usuarioNome?.trim()) {
      throw new Error('Todos os campos da reserva são obrigatórios.');
    }

    return new EmprestimoEntity({
      id,
      tituloItem: tituloItem.trim(),
      tipoItem: tipoItem.trim().toUpperCase(),
      usuarioNome: usuarioNome.trim(),
      dataReserva: new Date(),
      status: StatusEmprestimo.reservado(),
      renovacoesCount: 0,
      temAvaria: false,
      descricaoAvaria: null,
      createdAt: new Date(),
    });
  }

  static restore(props: EmprestimoProps): EmprestimoEntity {
    return new EmprestimoEntity(props);
  }

  // Regra de negócio: registrar retirada
  registrarRetirada(): void {
    if (!this.props.status.isReservado()) {
      throw new Error(
        `Apenas itens com status RESERVADO podem ser retirados. Status atual: ${this.props.status.getValue()}`,
      );
    }

    const agora = new Date();
    const dataPrevista = new Date();
    dataPrevista.setDate(agora.getDate() + 7);

    (this.props as any).dataRetirada = agora;
    (this.props as any).dataPrevistaDevolucao = dataPrevista;
    (this.props as any).status = StatusEmprestimo.retirado();
    (this.props as any).updateAt = agora;
  }

  // Regra de negócio: renovar prazo
  renovarPrazo(): void {
    if (!this.props.status.isRetirado() && !this.props.status.isAtrasado()) {
      throw new Error('Apenas itens retirados ou atrasados podem ter o prazo renovado.');
    }

    const agora = new Date();
    const baseData =
      this.props.dataPrevistaDevolucao && new Date(this.props.dataPrevistaDevolucao) > agora
        ? new Date(this.props.dataPrevistaDevolucao)
        : agora;

    const novaDataPrevista = new Date(baseData);
    novaDataPrevista.setDate(novaDataPrevista.getDate() + 7);

    (this.props as any).dataPrevistaDevolucao = novaDataPrevista;
    (this.props as any).renovacoesCount = this.props.renovacoesCount + 1;
    (this.props as any).status = StatusEmprestimo.retirado();
    (this.props as any).updateAt = agora;
  }

  // Regra de negócio: registrar devolução
  registrarDevolucao(temAvaria: boolean, descricaoAvaria?: string | null): void {
    if (this.props.status.isDevolvido()) {
      throw new Error('Este empréstimo já foi finalizado e devolvido.');
    }

    const agora = new Date();
    (this.props as any).dataDevolucao = agora;
    (this.props as any).status = StatusEmprestimo.devolvido();
    (this.props as any).temAvaria = temAvaria;
    (this.props as any).descricaoAvaria = temAvaria ? descricaoAvaria : null;
    (this.props as any).updateAt = agora;
  }

  // Regra de negócio: atualizar dados gerais do empréstimo/reserva
  atualizarDados(tituloItem: string, tipoItem: string, usuarioNome: string): void {
    if (!tituloItem?.trim() || !tipoItem?.trim() || !usuarioNome?.trim()) {
      throw new Error('Todos os campos são obrigatórios.');
    }
    (this.props as any).tituloItem = tituloItem.trim();
    (this.props as any).tipoItem = tipoItem.trim().toUpperCase();
    (this.props as any).usuarioNome = usuarioNome.trim();
    (this.props as any).updateAt = new Date();
  }
}
