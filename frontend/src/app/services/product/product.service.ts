import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {Product} from "../../model/product";

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  constructor(private httpClient: HttpClient) {
  }

  getProducts(): Observable<Array<Product>> {
    return this.httpClient.get<Array<Product>>('https://20.244.11.56/api/product');
  }

  createProduct(product: Product): Observable<Product> {
    return this.httpClient.post<Product>('https://20.244.11.56/api/product', product);
  }
}
