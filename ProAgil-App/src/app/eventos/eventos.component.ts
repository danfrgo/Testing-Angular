import { Component, OnInit, TemplateRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Evento } from '../_models/Evento';
import { EventoService } from '../_services/evento.service';
import { BsLocaleService } from 'ngx-bootstrap/datepicker';
import { ptBrLocale } from 'ngx-bootstrap/locale';
import { defineLocale } from 'ngx-bootstrap/chronos';
import { templateJitUrl } from '@angular/compiler';
import { ToastrService } from 'ngx-toastr';
defineLocale('pt-br', ptBrLocale);

@Component({
  selector: 'app-eventos',
  templateUrl: './eventos.component.html',
  styleUrls: ['./eventos.component.css']
})


export class EventosComponent implements OnInit {
  titulo = 'Eventos';

  eventosFiltrados: Evento[];

  eventos: Evento[];
  modoSalvar = 'post';

  evento: Evento;
  imagemLargura = 50; // em pixeis
  imagemMargem = 2;
  mostrarImagem = false;
  registerForm: FormGroup;
  bodyDeletarEvento = '';

  _filtroLista = '';
  // filtroLista: string ='';

  constructor(
    private eventoService: EventoService,
    private modalService: BsModalService,
    private fb: FormBuilder,
    private localeService: BsLocaleService,
    private toastr: ToastrService
  ) {
    this.localeService.use('pt-br');
  }

  get filtroLista(): string {
    return this._filtroLista;
  }

  set filtroLista(value: string) {
    this._filtroLista = value;
    // os eventosFiltrados recebem ou o resultado da funçao this.filtrarEventos(this._filtroLista) ou recebe os proprios eventos..
    // ... que vieram da propria API "this.eventos"
    this.eventosFiltrados = this.filtroLista
      ? this.filtrarEventos(this._filtroLista)
      : this.eventos;
  }

  editarEvento(evento: Evento, template: any) {
    this.modoSalvar = 'put';
    this.openModal(template);
    this.evento = evento;
    this.registerForm.patchValue(evento);
  }

  novoEvento(template: any) {
    this.modoSalvar = 'post';
    this.openModal(template);
  }

excluirEvento(evento: Evento, template: any){
  this.openModal(template);
  this.evento = evento;
  this.bodyDeletarEvento = `Pretendes mesmo exlcuír o Evento: ${evento.tema}, Código: ${evento.id}`;
}

confirmeDelete(template: any){
this.eventoService.deleteEvento(this.evento.id).subscribe(
  () => {
    template.hide();
    this.getEventos();
    this.toastr.success('Removido com sucesso');
  }, error => {
    this.toastr.error('Erro ao tentar apagar');
    console.log(error);
  }
);
}

  openModal(template: any) {
    this.registerForm.reset();
    template.show();
  }

  ngOnInit() {
    this.validation();
    this.getEventos();
  }

  filtrarEventos(filtrarPor: string): Evento[] {
    filtrarPor = filtrarPor.toLocaleLowerCase();
    return this.eventos.filter(
      (evento) => evento.tema.toLocaleLowerCase().indexOf(filtrarPor) !== -1
    );
  }

  alternarImagem() {
    this.mostrarImagem = !this.mostrarImagem;
  }

  validation() {
    this.registerForm = this.fb.group({
      tema: [
        '',
        [
          Validators.required,
          Validators.minLength(4),
          Validators.maxLength(50),
        ],
      ],
      local: ['', Validators.required],
      dataEvento: ['', Validators.required],
      imagemURL: ['', Validators.required],
      qtdPessoas: ['', [Validators.required, Validators.max(120000)]],
      telefone: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
    });
  }

  salvarAlteracao(template: any) {
    if (this.registerForm.valid) {
      if (this.modoSalvar === 'post') {
        this.evento = Object.assign({}, this.registerForm.value);
        this.eventoService.postEvento(this.evento).subscribe(
          (novoEvento: Evento) => {
            template.hide();
            this.getEventos();
            this.toastr.success('Inserido com sucesso');
          },
          (error) => {
            this.toastr.error(`Erro ao inserir: ${error}`);
          }
        ); // subscribe porque é observable
      } else {
        this.evento = Object.assign({id: this.evento.id}, this.registerForm.value);
        this.eventoService.putEvento(this.evento).subscribe(
          () => {
            template.hide();
            this.getEventos();
            this.toastr.success('Editado com sucesso');
          }, (error) => {
            this.toastr.error(`Erro ao editar: ${error}`);
            // console.log(error);
          }
        ); // subscribe porque é observable
      }
    }
  }

  getEventos() {
    // Serviço http encapsolado dentro do getEvento
    this.eventoService.getAllEvento().subscribe(
      (_eventos: Evento[]) => {
        this.eventos = _eventos;
        this.eventosFiltrados = this.eventos;
        // console.log(_eventos);
      },
      (error) => {
        // console.log(error);
        this.toastr.error(`Erro ao tentar carregar eventos: ${error}`);
      }
    );
  }
}
