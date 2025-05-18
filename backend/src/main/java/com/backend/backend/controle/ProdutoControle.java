package com.backend.backend.controle;

import org.springframework.web.bind.annotation.RestController;

import com.backend.backend.modelo.ProdutoModelo;
import com.backend.backend.serviço.ProdutoServico;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;


@RestController
public class ProdutoControle {

    @Autowired
    ProdutoServico ps;

    @GetMapping("/")
    public String rota () {
        return "A API está rodando!";
    }

    @GetMapping("/listar")
    public Iterable<ProdutoModelo> listar(){
        return ps.listar();
    }
}